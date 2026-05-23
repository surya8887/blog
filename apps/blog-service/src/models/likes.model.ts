import mongoose, { Schema, Document, Types, } from "mongoose";

export interface IPostLike extends Document {
    user: Types.ObjectId;
    post: Types.ObjectId;
}

const postLikeSchema = new Schema<IPostLike>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);


postLikeSchema.index(
    { user: 1, post: 1 },
    { unique: true }
);

export const PostLike = mongoose.model<IPostLike>(
    "PostLike",
    postLikeSchema
);