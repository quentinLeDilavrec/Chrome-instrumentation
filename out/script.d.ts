/**
 *
 * @param common_path prefix to remove from calls path
 * @param start_page first page loaded on the instrumented browser
 * @param output where the trace should go, use an absolute path to avoid troubles
 */
export declare function launchBrowser(common_path: string, start_page?: string, output?: string): Promise<void>;
