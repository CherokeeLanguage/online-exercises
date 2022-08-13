import React, { Reducer, useMemo, useReducer } from "react";

export type ImperativeBlock<State, Action> = (
  state: State,
  act: Act<State, Action>
) => State;

export type Act<State, Action> = (
  actions: Action[],
  then?: ImperativeBlock<State, Action>
) => State;

type ImperativeAction<State, Action> = {
  type: "imperative";
  block: ImperativeBlock<State, Action>;
};

type InternalAction<Action> = {
  type: "internal";
  inner: Action;
};

type ActionOrImperative<State, Action> =
  | ImperativeAction<State, Action>
  | InternalAction<Action>;

function actFunctionFactory<State, Action>(reducer: Reducer<State, Action>) {
  return function createActFunction(state: State): Act<State, Action> {
    return function (actions, then) {
      const newState = actions.reduce(reducer, state);
      if (then) return then(newState, createActFunction(newState));
      else return newState;
    };
  };
}

function wrapReducerWithImperative<State, Action>(
  reducer: Reducer<State, Action>
): Reducer<State, ActionOrImperative<State, Action>> {
  const createActFunction: (state: State) => Act<State, Action> =
    actFunctionFactory(reducer);

  function wrappedReducer(
    state: State,
    action: ActionOrImperative<State, Action>
  ) {
    if (action.type === "internal") return reducer(state, action.inner);
    else return action.block(state, createActFunction(state));
  }

  return wrappedReducer;
}

export type UseReducerWithImperativeReturn<State, Action> = [
  State,
  React.Dispatch<Action>,
  React.Dispatch<ImperativeBlock<State, Action>>
];

export function useReducerWithImperative<State, Action, I>(
  reducer: (state: State, action: Action) => State,
  initializerArg: I,
  initializer: (arg: I) => State
): UseReducerWithImperativeReturn<State, Action> {
  const wrappedReducer = useMemo(
    () => wrapReducerWithImperative(reducer),
    [reducer]
  );
  const [state, dispatch] = useReducer<
    Reducer<State, ActionOrImperative<State, Action>>,
    I
  >(wrappedReducer, initializerArg, initializer);

  // makes these reference never change, since dispatch never changes
  const dispatchInternal = useMemo(
    () => (action: Action) => dispatch({ type: "internal", inner: action }),
    [dispatch]
  );

  const dispatchBlock = useMemo(
    () => (block: ImperativeBlock<State, Action>) =>
      dispatch({ type: "imperative", block }),
    [dispatch]
  );

  return [state, dispatchInternal, dispatchBlock];
}
