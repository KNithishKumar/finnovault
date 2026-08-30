const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Notification = require('../models/Notification');
const Loan = require('../models/Loan');
const BorrowLend = require('../models/BorrowLend');

const initCronJobs = () => {
  // Run every night at midnight: '0 0 * * *'
  // For testing/demonstration, we can run it once upon start and then schedule hourly: '0 * * * *'
  cron.schedule('0 0 * * *', async () => {
    console.log('Running nightly financial cron scheduler...');
    try {
      const today = new Date();
      
      // 1. Process Recurring Transactions
      const recurringTx = await Transaction.find({
        isRecurring: true,
        nextRecurrenceDate: { $lte: today },
      });

      for (let tx of recurringTx) {
        // Create duplicate transaction
        const newTx = new Transaction({
          user: tx.user,
          type: tx.type,
          amount: tx.amount,
          category: tx.category,
          date: new Date(),
          description: `Recurring: ${tx.description || ''}`,
          account: tx.account,
          paymentMethod: tx.paymentMethod,
          status: 'completed',
        });

        await newTx.save();

        // Update target Account balance
        const account = await Account.findById(tx.account);
        if (account) {
          if (tx.type === 'income') {
            account.balance += tx.amount;
          } else if (['expense', 'investment', 'savings'].includes(tx.type)) {
            account.balance -= tx.amount;
          }
          await account.save();
        }

        // Calculate next recurrence date
        let nextDate = new Date(tx.nextRecurrenceDate);
        if (tx.recurrenceFrequency === 'daily') {
          nextDate.setDate(nextDate.getDate() + 1);
        } else if (tx.recurrenceFrequency === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (tx.recurrenceFrequency === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (tx.recurrenceFrequency === 'yearly') {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }

        tx.nextRecurrenceDate = nextDate;
        await tx.save();

        // Create notification
        const notif = new Notification({
          user: tx.user,
          message: `Recurring transaction "${tx.category} - ₹${tx.amount}" has been processed automatically.`,
          type: 'info',
        });
        await notif.save();
      }

      // 2. Scan Upcoming EMI and Loan Due Dates (Due in 3 days)
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + 3);

      const dueLoans = await Loan.find({
        status: 'active',
        nextDueDate: { $lte: warningDate },
      });

      for (let loan of dueLoans) {
        // Check if notification already sent in last 2 days
        const recentNotif = await Notification.findOne({
          user: loan.user,
          message: new RegExp(`EMI Payment for ${loan.name} is due`),
          createdAt: { $gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        });

        if (!recentNotif) {
          const notif = new Notification({
            user: loan.user,
            message: `EMI Payment for ${loan.name} is due on ${loan.nextDueDate.toLocaleDateString()}. Amount: ₹${loan.emi.toFixed(2)}.`,
            type: 'reminder',
            link: '/loans',
          });
          await notif.save();
        }
      }

      // 3. Scan Borrow/Lend Due Dates
      const dueDebts = await BorrowLend.find({
        status: 'pending',
        dueDate: { $lte: warningDate },
      });

      for (let debt of dueDebts) {
        const verb = debt.type === 'borrowed' ? 'Pay back' : 'Collect from';
        const label = debt.type === 'borrowed' ? 'to' : 'from';
        
        const recentNotif = await Notification.findOne({
          user: debt.user,
          message: new RegExp(`Reminder: ${verb} \\₹${debt.remainingAmount}`),
          createdAt: { $gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        });

        if (!recentNotif) {
          const notif = new Notification({
            user: debt.user,
            message: `Reminder: ${verb} ₹${debt.remainingAmount.toFixed(2)} ${label} ${debt.personName} by ${debt.dueDate.toLocaleDateString()}.`,
            type: 'reminder',
            link: '/borrow-lend',
          });
          await notif.save();
        }
      }

    } catch (err) {
      console.error('Error in financial cron jobs:', err);
    }
  });
};

module.exports = { initCronJobs };
