import mongoose, { Schema, Document, Types, } from "mongoose";

export interface IPostLike extends Document {
    user: {
        userId: string;
        name: string;
        avatar?: string;
    };
    post: Types.ObjectId;
}

const postLikeSchema = new Schema<IPostLike>(
    {
        user: {
            userId: {
                type: String,
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
    },
    {
        timestamps: true,
    }
);


postLikeSchema.index(
    { "user.userId": 1, post: 1 },
    { unique: true }
);

export const PostLike = mongoose.model<IPostLike>(
    "PostLike",
    postLikeSchema
);