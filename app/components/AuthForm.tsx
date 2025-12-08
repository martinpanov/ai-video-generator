"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ReactElement, useActionState } from "react";
import { login, register } from "../actions/auth";
import { LoaderCircle } from "lucide-react";

type Props = {
  callToAction: ReactElement;
  type: "Register" | "Login";
};

export const AuthForm = ({ callToAction, type }: Props) => {
  const isLogin = type === "Login";
  const authAction = isLogin ? login : register;
  const [state, action, pending] = useActionState<Record<string, string> | undefined, FormData>(authAction, undefined);

  return (
    <Card className="w-sm">
      <CardHeader>
        <CardTitle className="mx-auto">
          {type}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form id={isLogin ? "login-form" : "register-form"} action={action}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username:</FieldLabel>
              <Input id="username" name="username" required />
              {state?.username && (
                <p className="text-sm text-red-500 mt-1">{state.username}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password:</FieldLabel>
              <Input id="password" name="password" type="password" required />
              {state?.password && (
                <p className="text-sm text-red-500 mt-1">{state.password}</p>
              )}
            </Field>
            {state?.message && (
              <p className="text-sm text-red-500">{state.message}</p>
            )}
            <Field>
              <Button size="lg" type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Loading...
                  </>
                ) : type}
              </Button>
            </Field>
            <Field>
              {callToAction}
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};