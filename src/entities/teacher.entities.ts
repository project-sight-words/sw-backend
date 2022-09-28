export interface TeacherDatabaseObj {
  id: string;
  staff_id: string;
  name: string;
  updated_at: Date;
  updated_by: string;
}

export class TeachersEntity {
  private constructor(
    private _staff_id: string,
    private _name: string,
    // generated
    private _id?: string | undefined,
    private updated_at?: Date,
    private updated_by?: string | undefined,
  ) {}

  public get_staff_id(): string {
    return this._staff_id;
  }

  public get_name(): string {
    return this._name;
  }

  public static createTeacher(staffId: string, name: string): TeachersEntity {
    return new TeachersEntity(staffId, name);
  }

  public static loadTeacher(response: TeacherDatabaseObj): TeachersEntity {
    return new TeachersEntity(
      response.staff_id,
      response.name,
      response.id,
      response.updated_at,
      response.updated_by,
    );
  }
}
