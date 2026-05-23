import mongoose, { Schema, Document, Types, } from "mongoose";

export interface IComment extends Document {
    content: string;
    author: {
        userId: Types.ObjectId;
        name: string;
        avatar?: string;
    };
    post: Types.ObjectId;
    parentComment?: Types.ObjectId | null;
    isDeleted: boolean;
    deletedAt?: Date;
}

const commentSchema = new Schema<IComment>(
    {
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },

        author: {
            userId: {
                type: Schema.Types.ObjectId,
                required: true,
                index: true,
            },
            name: {
                type: String,
                required: true,
            },
            avatar: {
                type: String,
                default: "",
            },
        },

        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
            index: true,
        },

        // For nested replies
        parentComment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
            index: true,
        },
        // Soft delete
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },

        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export const Comment = mongoose.model<IComment>("Comment",commentSchema);