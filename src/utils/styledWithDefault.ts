import { StyledComponent } from "styled-components";

export function styledWithDefault<
  DefaultProps extends object,
  C extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
  T extends object,
  O extends DefaultProps,
  A extends string | number | symbol = never
>(
  component: StyledComponent<C, T, O, A>,
  defaultProps: DefaultProps
): StyledComponent<
  C,
  T,
  Omit<O, keyof DefaultProps> & Partial<DefaultProps>,
  A
> {
  component.defaultProps = defaultProps;
  return component as StyledComponent<
    C,
    T,
    Exclude<O, DefaultProps> & Partial<DefaultProps>,
    A
  >;
}
