export namespace User {
  export interface Model {
    id: string;
    name: string;
    email: string;
    password: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }
}
