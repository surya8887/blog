export interface IPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
