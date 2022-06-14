import React from "react";

interface Props {
  icon?: string;
  title?: string;
  action?: () => boolean;
  isActive?: () => boolean;
  type?: string;
}

export default (props: Props) => (
  <button
    type="button"
    className={`menu-item${
      props.isActive && props.isActive() ? " is-active" : ""
    }`}
    onClick={props.action}
    title={props.title}
  >
    <i className={`ri-${props.icon}`}></i>
  </button>
);
