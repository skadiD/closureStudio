// @ts-ignore
export interface StackToRender {
    func_name: string;
    ordered_varnames: string[];
    is_highlighted: boolean;
    frame_id: string;
    unique_hash: string;
    line: number;
    is_parent: boolean;
    is_zombie: boolean;
    parent_frame_id_list: any[];
    encoded_locals: {
        [key: string]: string[];
    };
}

export interface TraceInfo {
    heap: Object;
    stack_to_render: StackToRender[];
    globals: Object;
    ordered_globals: any[];
    line: number;
    func_name: string;
    event: string;
    stdout: string;
}