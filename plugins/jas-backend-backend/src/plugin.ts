import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { createTodoListService } from './services/TodoListService';

/**
 * jasBackendPlugin backend plugin
 *
 * @public
 */
export const jasBackendPlugin = createBackendPlugin({
  pluginId: 'jas-backend',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        catalog: catalogServiceRef,
      },
      async init({ logger, httpAuth, httpRouter, catalog }) {
        const todoListService = await createTodoListService({
          logger,
          catalog,
        });

        httpRouter.use(
          await createRouter({
            httpAuth,
            todoListService,
          }),
        );
      },
    });
  },
});
