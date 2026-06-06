class ApiError extends Error {
    public statusCode : number;
    public errors : any[];
    public stack?: string;
    public message : string;
    public success : boolean = false;

    constructor(message: string, status: number, stack: string = '', errors?: any[]) {
        super(message);
        this.statusCode = status;
        this.message = message;
        this.success = false;
        this.errors = errors || [];
        
        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };