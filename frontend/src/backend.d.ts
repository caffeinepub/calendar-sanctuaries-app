import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Sanctuary {
    date: Time;
    name: string;
    description: string;
}
export type Time = bigint;
export interface backendInterface {
    addSanctuary(name: string, description: string, date: Time): Promise<void>;
    getAllSanctuaries(): Promise<Array<Sanctuary>>;
    getDaySanctuaries(targetTime: Time): Promise<Array<Sanctuary>>;
    getSanctuariesByMonth(targetTime: Time): Promise<Array<Sanctuary>>;
    getSanctuariesByYear(targetTime: Time): Promise<Array<Sanctuary>>;
    getSanctuary(id: string): Promise<Sanctuary>;
}
