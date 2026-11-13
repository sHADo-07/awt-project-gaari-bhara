import { INestApplication } from "@nestjs/common";
import { AllExceptionsFilter } from "@/common/filters/all-exceptions.filter";
import { requestLogger } from "@/common/middlewares/request-logger.middleware";
import { ValidationPipe } from "@/common/pipes";

/** Rules for the whole app. main.ts and the tests both call this, so they behave the same. */
export function setupApp(app: INestApplication) {
  app.use(requestLogger);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
}
