/*
  Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
  EUPL-1.2 or later. This open-source code is licensed following the Attribution
  4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
  — CC BY 4.0.

  Following this, you are accessible to:

  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.

  Remark: The licensor cannot revoke these freedoms if you follow the license
  terms.

  Under the following terms:

  Attribution - You must give appropriate credit, provide a link to the license,
  and indicate if changes were made. You may do so reasonably but not in any way
  that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological
  measures that legally restrict others from doing anything the license permits.
*/
import { pool, WorkerPool } from 'workerpool';

export interface WorkerOptions {
  maxWorkers?: number;
  workerPath?: string;
}

/**
 * Worker: wrapper for workerpool functionality
 */
export class Worker {
  public instance: WorkerPool;

  constructor(options?: WorkerOptions) {
    // get options and set defaults
    const workerOptions = {
      maxWorkers: options?.maxWorkers ?? 2,
      // set a random debug port start (1024 to 65535) as workerpool always sets the same value
      // using the random value cannot start 2 workers at the same time in debug mode
      debugPortStart: Math.floor(Math.random() * 64000) + 1024
    };

    // check for workerPath
    if (options?.workerPath) {
      this.instance = pool(options?.workerPath, workerOptions);
    } else {
      this.instance = pool(workerOptions);
    }
  }
}
