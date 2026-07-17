import { ShootermarktMark } from "./ShootermarktMark";

export function ShootermarktLogo() {
  return (
    <div aria-label="Shootermarkt Editorial Studio" className="shootermarkt-logo" role="img">
      <ShootermarktMark />
      <span>
        <strong>SHOOTERMARKT</strong>
        <small>EDITORIAL STUDIO</small>
      </span>
    </div>
  );
}
