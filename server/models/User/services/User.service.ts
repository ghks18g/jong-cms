import DataSourceService from "server/lib/DataSourceService";
import { UserEntity } from "../entities/User.entity";

export default class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }

    return UserService.instance;
  }

  async getUserByEmail(email: string) {
    const dataSource = await DataSourceService.getDataSource();

    return await dataSource
      .createQueryBuilder(UserEntity, "user")
      .where("user.email = :email", { email })
      .getOne();
  }

  async getUserById(id: string) {
    const dataSource = await DataSourceService.getDataSource();

    return await dataSource
      .createQueryBuilder(UserEntity, "user")
      .where("user.id = :id", { id })
      .getOne();
  }
}
