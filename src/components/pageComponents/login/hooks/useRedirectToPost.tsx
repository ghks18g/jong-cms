require("dotenv").config();
import { useCallback } from "react";
import { useRouter } from "next/router";

export function getPostForm(url: string, data: object, options: object) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.enctype = "application/x-www-form-urlencoded";

  for (const key in data) {
    const element = document.createElement("input");
    element.value = data[key];
    element.name = key;
    element.type = "hidden";
    form.appendChild(element);
  }

  for (const key in options) {
    form[key] = options[key];
  }

  return form;
}

function redirectToPost(url: string, data: object, options: object) {
  const form = getPostForm(url, data, options);
  document.body.appendChild(form);
  form.submit();
}

export default function useRedirectToPost() {
  const { query } = useRouter();

  const _redirectToPost = useCallback(
    (url: string, data: object, options: object = {}) => {
      if (url.startsWith("http")) {
        redirectToPost(url, data, options);
      } else {
        let redirectUrl = url.startsWith("/") ? url : "/" + url;
        redirectToPost(`/` + redirectUrl, data, options);
      }
    },
    []
  );

  return {
    redirectToPost: _redirectToPost,
  };
}
