import { Document, Schema, Types } from "mongoose";
import mongoose from "mongoose";

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: {
    userId: string;
    name: string;
    avatar?: string;
  };
  category?: Types.ObjectId;
  tags?: string[];
  status: "draft" | "published" | "archived";
  publishedAt?: Date;

  likeCount: number;
  commentCount: number;
  viewCount: number;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
    },

    excerpt: {
      type: String,
      maxlength: 500,
    },

    coverImage: {
      type: String,
      default: "",
    },

    author: {
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

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    tags: [{
      type: String,
      trim: true
    }],

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },

    likeCount: {
      type: Number,
      default: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
    },

    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ title: "text", content: "text" });

export const Post = mongoose.model<IPost>("Post", postSchema);