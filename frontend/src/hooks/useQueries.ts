import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Sanctuary } from '../backend';

// Convert JS Date to nanosecond bigint timestamp (ICP Time)
export function dateToNanoseconds(date: Date): bigint {
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

// Convert nanosecond bigint to JS Date
export function nanosecondsToDate(ns: bigint): Date {
  return new Date(Number(ns / BigInt(1_000_000)));
}

export function useGetAllSanctuaries() {
  const { actor, isFetching } = useActor();

  return useQuery<Sanctuary[]>({
    queryKey: ['sanctuaries', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSanctuaries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSanctuariesByMonth(year: number, month: number) {
  const { actor, isFetching } = useActor();

  // Create a date in the middle of the target month
  const targetDate = new Date(year, month, 15, 12, 0, 0);
  const targetTime = dateToNanoseconds(targetDate);

  return useQuery<Sanctuary[]>({
    queryKey: ['sanctuaries', 'month', year, month],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSanctuariesByMonth(targetTime);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSanctuary() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      date,
    }: {
      name: string;
      description: string;
      date: Date;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      const timeNs = dateToNanoseconds(date);
      await actor.addSanctuary(name, description, timeNs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sanctuaries'] });
    },
  });
}
