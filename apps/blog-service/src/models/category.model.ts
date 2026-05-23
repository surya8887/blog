import { Document, Schema, Types } from "mongoose";
import mongoose from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    parent?: Types.ObjectId;
}

const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },

        parent: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const Category = mongoose.model<ICategory>("Category", categorySchema);