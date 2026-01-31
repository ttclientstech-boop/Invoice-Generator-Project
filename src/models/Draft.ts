import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IDraft extends Document {
    name: string; // Auto-generated or custom name
    data: any; // The full form data state
    currentStep: number;
    updatedAt: Date;
    createdAt: Date;
}

const DraftSchema = new Schema<IDraft>({
    name: {
        type: String,
        default: 'Untitled Draft'
    },
    data: {
        type: Schema.Types.Mixed,
        required: true
    },
    currentStep: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

const Draft = models.Draft || model<IDraft>('Draft', DraftSchema);

export default Draft;
