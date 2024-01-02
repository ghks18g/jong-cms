import { DataSource, DataSourceOptions } from "typeorm";

export default class DataSourceService {
  private static instance: DataSourceService;
  private dataSource: DataSource;

  private constructor() {
    const dataSourceOptions: DataSourceOptions = {
      type: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: true,
      entities: ["server/models/**/*.entity.{js,ts}"],
    };
    this.dataSource = new DataSource(dataSourceOptions);
    DataSourceService.instance = this;
  }

  static async getDataSource() {
    if (!this.instance) {
      this.instance = new DataSourceService();
    }
    const dataSource = this.instance.dataSource;
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    return dataSource;
  }
}
