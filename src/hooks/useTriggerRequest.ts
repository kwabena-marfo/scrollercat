import { useState } from "react";

import axios from "@/config/axios";

export default function useTriggerRequest() {
  type TriggerProps = {
    route: string;
    reqType: "get" | "post" | "put" | "delete";
    data?: object;
  };

  type SetReqStateProps = {
    pending?: boolean;
    data?: any;
    error?: string | object;
  };

  const [reqState, setReqState] = useState<SetReqStateProps | null>();

  const globalTrigger = async ({ route, reqType, data }: TriggerProps) => {
    try {
      setReqState({ pending: true });

      const response = await axios[reqType](route, data && data);

      setReqState({ data: response.data });
    } catch ({ response }: any) {
      setReqState({ error: response?.data || "Error" });
    }
  };
  return {
    reqFunction: globalTrigger,
    setReqState,
    reqState,
  };
}
