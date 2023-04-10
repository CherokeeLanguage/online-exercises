import { ReactElement } from "react";
import { NavigationButtons, Step, StepProps } from ".";
import { Button } from "../Button";

export const Preamble: Step = {
  title: "Welcome to Cheroke Language Exercises!",
  commitState: () => {},
  Component: FakeStepComponent,
};

function FakeStepComponent({
  wizardState,
  goToNextStep,
  goToPreviousStep,
}: StepProps): ReactElement {
  return (
    <div>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sit amet luctus lacus. Ut arcu odio, placerat eu odio at, laoreet dictum urna. Cras a ipsum ante. Nulla consequat lorem nec consectetur commodo. Integer a elit ut velit ullamcorper elementum in eu nunc. Aliquam erat volutpat. Duis sed nisi ante. Aliquam convallis facilisis mauris et laoreet. Vestibulum nec tincidunt eros. Cras consectetur tortor quam, sed rutrum risus volutpat ac. Fusce pellentesque quis nulla et congue. Mauris vitae urna nec neque placerat imperdiet ut pellentesque tortor. Vestibulum at porta neque. Phasellus auctor, mi quis tincidunt sodales, dui risus pretium tellus, vehicula condimentum orci ex sed leo. Integer faucibus sodales euismod. Integer quis mauris elementum, varius felis non, porttitor libero.

  Aliquam eget auctor turpis. Nulla augue sem, tincidunt ac urna ac, aliquet efficitur est. Nunc laoreet sem ut dignissim hendrerit. Nulla egestas dignissim quam ut pulvinar. Phasellus condimentum, velit non volutpat ultrices, est sapien blandit ex, egestas vestibulum ligula est quis mi. Vestibulum pulvinar augue interdum arcu sodales luctus. Duis viverra condimentum eros, at malesuada urna faucibus non. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.

Nunc malesuada lacus vel purus facilisis pharetra. Vivamus eu tortor pretium, venenatis sapien et, tempus ipsum. Phasellus quis libero varius, suscipit urna vitae, aliquam purus. Proin elementum, ipsum non consequat aliquet, turpis est posuere massa, vitae iaculis magna orci sit amet est. Vestibulum non nulla ac odio pulvinar tempus. Morbi ac risus in velit semper tincidunt. Curabitur imperdiet urna erat, ut tincidunt diam molestie eu. Nunc quis laoreet ante, ac consequat massa. Suspendisse eleifend vel ante vitae imperdiet.
      <NavigationButtons
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}

      />
    </div>
  );
}
