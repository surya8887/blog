import type { PipelineStage, Model } from "mongoose";

interface PaginationOptions {
    page: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    docs: T[];
    pagination: {
        totalDocs: number;
        totalPages: number;
        currentPage: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export const aggregatePaginate = async <T>(
    model: Model<any>,
    pipeline: PipelineStage[],
    options: PaginationOptions
): Promise<PaginatedResponse<T>> => {
    const page = Math.max(1, options.page);
    const limit = Math.max(1, options.limit);
    const skip = (page - 1) * limit;

    const aggregatePipeline: PipelineStage[] = [
        ...pipeline,
        {
            $facet: {
                metadata: [{ $count: "totalDocs" }],
                data: [{ $skip: skip }, { $limit: limit }],
            },
        },
    ];

    const result = await model.aggregate(aggregatePipeline);
    
    const totalDocs = result[0]?.metadata[0]?.totalDocs || 0;
    const totalPages = Math.ceil(totalDocs / limit);
    const docs = result[0]?.data || [];

    return {
        docs,
        pagination: {
            totalDocs,
            totalPages,
            currentPage: page,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
};
