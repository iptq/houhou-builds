export interface ConditionalWrapperProps<S, T> {
  condition: boolean;
  wrapper?: (_: S) => T;
  elseWrapper?: (_: S) => T;
  children: S;
}

export default function ConditionalWrapper<S, T>({
  condition,
  wrapper,
  children,
  elseWrapper,
}: ConditionalWrapperProps<S, T>) {
  return condition
    ? wrapper
      ? wrapper(children)
      : children
    : elseWrapper
    ? elseWrapper(children)
    : children;
}
