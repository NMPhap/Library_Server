import { Document, Schema, model, Types } from 'mongoose';
import UserFinancials from './userFinancialsModel';
import AppError from '../utils/appError';
import { IUserFinancials, IUserTransaction } from '../interfaces/IModel';

const UserTransactionSchema = new Schema({
  userFinancials: {
    type: Types.ObjectId,
    required: true
  },
  money: {
    type: Number,
    default: 0,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: String,
    default: 'failure',
    validate: {
      validator: function (value: string) {
        return value === 'success' || value === 'failure';
      },
      message: `Status must be either "success" or "failure"`
    }
  }
});

UserTransactionSchema.pre<IUserTransaction>('save', async function (next) {
  if (!this.isModified('status') || this.isNew) return next();
  if (this.status === 'success') {
    const userFinancials: IUserFinancials | null = await UserFinancials.findById(
      this.userFinancials
    );
    if (!userFinancials) {
      return next(new AppError(`User not found!`, 404));
    }

    userFinancials.money += this.money;
    userFinancials.save();
  }

  next();
});

const UserTransaction = model<IUserTransaction>('UserTransaction', UserTransactionSchema);

export default UserTransaction;
