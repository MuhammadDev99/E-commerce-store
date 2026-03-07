import type { ReactElement } from "react";

export function DebugObjectView(jsonObject: any): ReactElement {
    return (
        <pre>
            {JSON.stringify(jsonObject, null, 2)}
        </pre>
    )
}