import mongoose from 'mongoose';
import { config } from './config/env.js';
import { User } from './models/user.model.js';
import { Customer } from './models/customer.model.js';
import { Product } from './models/product.model.js';
import { Transaction } from './models/transaction.model.js';
import { Subscription } from './models/subscription.model.js';
import { Notification } from './models/notification.model.js';

const seed = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing demo user and records
    const demoEmail = 'demo@payflow.test';
    const existingUser = await User.findOne({ email: demoEmail });
    if (existingUser) {
      await Promise.all([
        Customer.deleteMany({ user: existingUser._id }),
        Product.deleteMany({ user: existingUser._id }),
        Transaction.deleteMany({ user: existingUser._id }),
        Subscription.deleteMany({ user: existingUser._id }),
        Notification.deleteMany({ user: existingUser._id }),
        User.deleteOne({ _id: existingUser._id }),
      ]);
      console.log('[Seed] Cleared previous demo records');
    }

    // 1. Create Demo Merchant User
    const user = await User.create({
      name: 'Sarah Connor',
      email: demoEmail,
      password: 'Password123!',
      businessName: 'Cyberdyne Payments Inc',
      role: 'merchant',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });
    console.log('[Seed] Created demo user:', user.email);

    // 2. Create Customers
    const customers = await Customer.insertMany([
      {
        user: user._id,
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        company: 'Nexus Digital Tech',
        address: { line1: '402 Sunrise Heights', city: 'Bengaluru', state: 'Karnataka', postalCode: '560001', country: 'India' },
        notes: 'Enterprise account lead',
        totalSpent: 45999,
        totalOrders: 3,
        status: 'active',
      },
      {
        user: user._id,
        name: 'Priya Patel',
        email: 'priya.patel@innovate.co',
        phone: '+91 98234 56789',
        company: 'Innovate AI Labs',
        address: { line1: '12 Linking Road', city: 'Mumbai', state: 'Maharashtra', postalCode: '400050', country: 'India' },
        notes: 'Subscribed to Pro annual tier',
        totalSpent: 29999,
        totalOrders: 2,
        status: 'active',
      },
      {
        user: user._id,
        name: 'Rohan Mehta',
        email: 'rohan@fintechcloud.io',
        phone: '+91 99887 66554',
        company: 'Fintech Cloud Systems',
        address: { line1: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', postalCode: '201301', country: 'India' },
        notes: 'Experienced payment failure previously',
        totalSpent: 4999,
        totalOrders: 1,
        status: 'active',
      },
      {
        user: user._id,
        name: 'Ananya Verma',
        email: 'ananya@creativesparks.org',
        phone: '+91 91234 56780',
        company: 'Creative Sparks Studio',
        address: { line1: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', postalCode: '500034', country: 'India' },
        notes: 'Monthly subscriber',
        totalSpent: 12499,
        totalOrders: 4,
        status: 'active',
      },
      {
        user: user._id,
        name: 'Vikram Singh',
        email: 'vikram.singh@apexglobal.in',
        phone: '+91 97112 33445',
        company: 'Apex Global Logistics',
        address: { line1: 'MG Road', city: 'Gurugram', state: 'Haryana', postalCode: '122002', country: 'India' },
        notes: 'High-volume customer',
        totalSpent: 64999,
        totalOrders: 5,
        status: 'active',
      },
    ]);
    console.log(`[Seed] Created ${customers.length} demo customers`);

    // 3. Create Products
    const products = await Product.insertMany([
      {
        user: user._id,
        name: 'Starter Plan',
        description: 'Core dashboard access and payment gateway integration',
        sku: 'PLAN-STARTER-01',
        price: 999,
        currency: 'INR',
        category: 'Subscriptions',
        type: 'recurring',
        status: 'active',
      },
      {
        user: user._id,
        name: 'Pro Tier Suite',
        description: 'Full automated recovery workflows, analytics & webhooks',
        sku: 'PLAN-PRO-02',
        price: 4999,
        currency: 'INR',
        category: 'Subscriptions',
        type: 'recurring',
        status: 'active',
      },
      {
        user: user._id,
        name: 'Enterprise Custom',
        description: 'Dedicated account manager, high-throughput SLAs',
        sku: 'PLAN-ENT-03',
        price: 19999,
        currency: 'INR',
        category: 'Subscriptions',
        type: 'recurring',
        status: 'active',
      },
      {
        user: user._id,
        name: 'Architecture & Security Audit',
        description: 'Comprehensive 1-on-1 payment architecture audit',
        sku: 'SRV-AUDIT-01',
        price: 14999,
        currency: 'INR',
        category: 'Professional Services',
        type: 'one_time',
        status: 'active',
      },
      {
        user: user._id,
        name: 'White-glove Gateway Migration',
        description: 'Zero-downtime payment stack migration service',
        sku: 'SRV-MIGR-02',
        price: 24999,
        currency: 'INR',
        category: 'Professional Services',
        type: 'one_time',
        status: 'active',
      },
    ]);
    console.log(`[Seed] Created ${products.length} demo products`);

    // 4. Create Transactions over 30 days
    const transactions = [];
    const methods = ['card', 'upi', 'netbanking', 'wallet'];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
      const customer = customers[i % customers.length];
      const product = products[i % products.length];
      const daysAgo = Math.floor(Math.random() * 28);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 3600000);
      
      const isFailed = i === 3 || i === 8 || i === 15;
      const isPending = i === 22;
      const status = isFailed ? 'failed' : isPending ? 'created' : 'captured';

      const amount = product.price;
      const amountInPaise = amount * 100;
      const rzpOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;
      const rzpPaymentId = status === 'captured' ? `pay_${Math.random().toString(36).substring(2, 12)}` : null;

      let failureReason = null;
      let failureCode = null;
      if (isFailed) {
        if (i === 3) {
          failureReason = 'Payment failed due to card expiration or insufficient balance';
          failureCode = 'INSUFFICIENT_FUNDS';
        } else if (i === 8) {
          failureReason = 'Bank gateway timeout during OTP verification';
          failureCode = 'GATEWAY_TIMEOUT';
        } else {
          failureReason = 'User declined 3D Secure authentication challenge';
          failureCode = 'AUTHENTICATION_DECLINED';
        }
      }

      transactions.push({
        user: user._id,
        customer: customer._id,
        product: product._id,
        amount,
        amountInPaise,
        currency: 'INR',
        status,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
        razorpaySignature: status === 'captured' ? `sig_${Math.random().toString(36).substring(2, 14)}` : null,
        method: methods[i % methods.length],
        fee: status === 'captured' ? Math.round(amount * 0.02) : 0,
        tax: status === 'captured' ? Math.round(amount * 0.0036) : 0,
        failureReason,
        failureCode,
        description: `Payment for ${product.name}`,
        createdAt,
        updatedAt: createdAt,
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`[Seed] Created ${transactions.length} demo transactions`);

    // 5. Create Subscriptions
    const subscriptions = await Subscription.insertMany([
      {
        user: user._id,
        customer: customers[0]._id,
        product: products[1]._id,
        plan: 'Pro',
        amount: 4999,
        currency: 'INR',
        interval: 'monthly',
        status: 'active',
        currentPeriodStart: new Date(Date.now() - 10 * 86400000),
        currentPeriodEnd: new Date(Date.now() + 20 * 86400000),
      },
      {
        user: user._id,
        customer: customers[1]._id,
        product: products[2]._id,
        plan: 'Enterprise',
        amount: 19999,
        currency: 'INR',
        interval: 'monthly',
        status: 'active',
        currentPeriodStart: new Date(Date.now() - 5 * 86400000),
        currentPeriodEnd: new Date(Date.now() + 25 * 86400000),
      },
      {
        user: user._id,
        customer: customers[3]._id,
        product: products[0]._id,
        plan: 'Basic',
        amount: 999,
        currency: 'INR',
        interval: 'monthly',
        status: 'active',
        currentPeriodStart: new Date(Date.now() - 15 * 86400000),
        currentPeriodEnd: new Date(Date.now() + 15 * 86400000),
      },
    ]);
    console.log(`[Seed] Created ${subscriptions.length} demo subscriptions`);

    // 6. Create Notifications
    await Notification.insertMany([
      {
        user: user._id,
        title: 'High-Value Payment Received',
        message: 'Payment of ₹19,999 captured for Enterprise Custom subscription.',
        type: 'payment_success',
        isRead: false,
        link: '/payments',
      },
      {
        user: user._id,
        title: 'Payment Failed — Action Recommended',
        message: 'Aarav Sharma payment of ₹4,999 failed due to bank timeout. Retry order ready.',
        type: 'payment_failed',
        isRead: false,
        link: '/failed-payments',
      },
      {
        user: user._id,
        title: 'New Pro Subscriber',
        message: 'Priya Patel joined Pro Tier Suite.',
        type: 'subscription_created',
        isRead: true,
        link: '/subscriptions',
      },
    ]);
    console.log('[Seed] Created demo notifications');

    console.log('\n=============================================');
    console.log('🎉 SEED COMPLETED SUCCESSFULLY');
    console.log('Credentials for Login:');
    console.log('Email:    demo@payflow.test');
    console.log('Password: Password123!');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seed();
