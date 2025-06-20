export interface ITypeInfo {
    fieldName: string;
    type: string;
    boundModel?: string
}

export interface ITypesResponse {
    success: boolean;
    data: {
        types: ITypeInfo[];
    };
}