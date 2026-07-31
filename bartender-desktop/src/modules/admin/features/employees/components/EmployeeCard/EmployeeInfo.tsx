/**
 * EMPLOYEE INFO
 * Componente de información básica de empleado
 */

"use client";

import type { Employee } from "../../types";
import { getRoleLabel } from "../../utils";

interface Props {
  employee: Employee;
}

export function EmployeeInfo({ employee }: Props) {
  return (
    <div>
      <h3 className="text-lg font-bold text-white tracking-tight uppercase leading-none">
        {employee.name}
      </h3>
      <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider mt-1">
        {employee.email}
      </p>
    </div>
  );
}
