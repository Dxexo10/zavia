import type { ErrorCode } from "@/application/result";

export type LogEntry = {
  requestId: string;
  action: string;
  result: "success" | "failure";
  errorCode?: ErrorCode;
  durationMs: number;
};

export type LogSink = (entry: LogEntry) => void;

export function createLogger(sink: LogSink) {
  return {
    log(entry: LogEntry): void {
      sink({
        requestId: entry.requestId,
        action: entry.action,
        result: entry.result,
        ...(entry.errorCode === undefined ? {} : { errorCode: entry.errorCode }),
        durationMs: entry.durationMs
      });
    }
  };
}
