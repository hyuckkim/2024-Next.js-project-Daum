// chart.tsx
import {
  BlockSchemaWithBlock,
  defaultProps,
  // createReactBlockSpec,
} from "@blocknote/core";
import { ReactSlashMenuItem, createReactBlockSpec } from "@blocknote/react";
import { PieChart } from "lucide-react";
import React, { useEffect, useState } from "react";

const getDefaultTableData = (): string[][] => [
  ["First Name", "Second Name", "Third Name"],
  ["", "", ""],
];

const RenderChartBlock = ({
  name,
  tableData,
  onChange,
}: {
  name: string;
  tableData: string[][];
  onChange: (name: string, tableData: string[][]) => void;
}) => {
  const addRow = () => {
    const newRow = ["", "", ""];
    onChange(name, [...tableData, newRow]); // 외부에서 데이터 변경 처리
  };

  const addColumn = () => {
    const updatedTableData = tableData.map((row) => [...row, ""]);
    onChange(name, updatedTableData); // 외부에서 데이터 변경 처리
  };

  const deleteRow = (index: number) => {
    const updatedTableData = [...tableData];
    updatedTableData.splice(index, 1);
    onChange(name, updatedTableData); // 외부에서 데이터 변경 처리
  };

  const deleteColumn = (index: number) => {
    const updatedTableData = tableData.map((row) => {
      const newRow = [...row];
      newRow.splice(index, 1);
      return newRow;
    });
    onChange(name, updatedTableData); // 외부에서 데이터 변경 처리
  };

  const handleDataChange = (
    rowIndex: number,
    cellIndex: number,
    value: string
  ) => {
    const updatedTableData = tableData.map((row, rIndex) =>
      rIndex === rowIndex
        ? row.map((cell, cIndex) => (cIndex === cellIndex ? value : cell))
        : row
    );
    onChange(name, updatedTableData); // 외부에서 데이터 변경 처리
  };

  const deleteButtons = (
    <>
      <button
        onClick={() => deleteRow(tableData.length - 1)}
        style={{
          borderRadius: "10px",
          backgroundColor: "red",
          color: "white",
          padding: "5px",
          margin: "5px",
        }}
      >
        Delete Last Row
      </button>
      <button
        onClick={() => deleteColumn(tableData[0].length - 1)}
        style={{
          borderRadius: "10px",
          backgroundColor: "red",
          color: "white",
          padding: "5px",
          margin: "5px",
        }}
      >
        Delete Last Column
      </button>
    </>
  );

  return (
    <div>
      <h1 style={{ fontWeight: "bold" }}>Pie Chart Table</h1>{" "}
      <table id="chartTable">
        {tableData.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>
                <input
                  value={cell}
                  onChange={(e) =>
                    handleDataChange(rowIndex, cellIndex, e.target.value)
                  }
                />
              </td>
            ))}
          </tr>
        ))}
      </table>
      <button
        onClick={addRow}
        style={{
          borderRadius: "10px",
          backgroundColor: "black",
          color: "white",
          padding: "5px",
          margin: "5px",
        }}
      >
        Add Row
      </button>
      <button
        onClick={addColumn}
        style={{
          borderRadius: "10px",
          backgroundColor: "black",
          color: "white",
          padding: "5px",
          margin: "5px",
        }}
      >
        Add Column
      </button>
      {deleteButtons}
    </div>
  );
};

export const chartBlock = createReactBlockSpec(
  {
    type: "chart",
    propSchema: {
      ...defaultProps,
      name: {
        default: "chart block",
      },
      tableData: {
        default: JSON.stringify(getDefaultTableData()),
      },
    } as const,
    content: "none",
  },
  {
    render: ({ block, editor }: { block: any; editor: any }) => {
      return (
        <RenderChartBlock
          name={block.props.name}
          onChange={(name, tableData) => {
            // onChange 함수 수정
            editor.updateBlock(block, {
              type: "chart",
              props: { name: name, tableData: JSON.stringify(tableData) },
            });
          }}
          tableData={JSON.parse(block.props.tableData)}
        />
      );
    },
  }
);

export const insertChartBlock: ReactSlashMenuItem<
  BlockSchemaWithBlock<"chart", typeof chartBlock.config>
> = {
  name: "Insert Chart Block",
  execute: (editor) => {
    editor.insertBlocks(
      [
        {
          type: "chart",
          props: {
            tableData: JSON.stringify(getDefaultTableData()),
          },
        },
      ],
      editor.getTextCursorPosition().block,
      "after"
    );
  },
  group: "Media",
  icon: <PieChart width="14" height="14" />,
  hint: "Insert a chart block!",
};

export default RenderChartBlock;
