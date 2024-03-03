import {
  BlockSchemaWithBlock,
  defaultProps,
  // createReactBlockSpec,
} from "@blocknote/core";
import { ReactSlashMenuItem, createReactBlockSpec } from "@blocknote/react";
import { PieChart } from "lucide-react";
import React, { useEffect, useState } from "react";
import Chart from "chart.js/auto";

const PieChartComponent = ({
  id, // 차트마다 id값
  name,
  tableData,
  onChange,
  onChartCreated,
}: {
  id: string; // 차트마다 id값
  name: string;
  tableData: string[][];
  onChange: (name: string, tableData: string[][]) => void;
  onChartCreated: () => void;
}) => {
  useEffect(() => {
    // JSON 데이터를 파이 차트 데이터 형식으로 변환
    const labels = tableData.map((row) => row[0]); // 첫 번째 열을 라벨로 사용
    const data = tableData.map((row) => parseFloat(row[1])); // 두 번째 열을 데이터로 사용

    // 차트 생성
    const ctx = document.getElementById(`${id}_pieChart`) as HTMLCanvasElement; // ID 값 -> 캔버스 요소
    let chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
    });

    // 새로운 차트가 생성될 때 호출되는 콜백 함수 실행
    onChartCreated();

    // 컴포넌트가 언마운트되기 전에 차트 파기
    return () => {
      chart.destroy();
    };
  }, [id, tableData, onChartCreated]);

  return (
    <div style={{ width: "450px", height: "450px" }}>
      <canvas id={`${id}_pieChart`} width="100%" height="100%"></canvas>
    </div>
  ); // 차트 ID값 사용-> 서로 다른 캔버스 생성 // 차트 ID값 사용-> 서로 다른 캔버스 생성
};

const getDefaultTableData = (): string[][] => [
  ["First Name", ""],
  ["Second Name", ""],
  ["Third Name", ""],
];

const RenderChartBlock = ({
  id, // 차트마다 id값
  name,
  tableData,
  onChange,
  onChartCreated,
}: {
  id: string; // 차트마다 id값
  name: string;
  tableData: string[][];
  onChange: (name: string, tableData: string[][]) => void;
  onChartCreated: () => void;
}) => {
  const [chartCreated, setChartCreated] = useState(false);

  const handleInputComplete = () => {
    if (chartCreated) return;
    setChartCreated(true);
  };

  const addRow = () => {
    const newRow = ["", ""];
    onChange(name, [...tableData, newRow]);
  };

  const deleteRow = (index: number) => {
    const updatedTableData = [...tableData];
    updatedTableData.splice(index, 1);
    onChange(name, updatedTableData);
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
    onChange(name, updatedTableData);
  };

  const deleteButtons = (
    <>
      <button
        onClick={() => deleteRow(tableData.length - 1)}
        style={{
          borderRadius: "10px",
          backgroundColor: "#ff4500",
          color: "white",
          padding: "5px",
          margin: "5px",
        }}
      >
        마지막 행 삭제
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
        onClick={handleInputComplete}
        style={{
          borderRadius: "10px",
          backgroundColor: "#FFA979",
          color: "white",
          padding: "5px",
          margin: "5px",
        }}
      >
        차트 생성
      </button>
      <button
        onClick={addRow}
        style={{
          borderRadius: "10px",
          backgroundColor: "gray",
          color: "white",
          padding: "5px",
          margin: "5px",
        }}
      >
        행 추가
      </button>
      {deleteButtons}
      {chartCreated && (
        <PieChartComponent
          id={id}
          name={name}
          tableData={tableData}
          onChange={onChange}
          onChartCreated={onChartCreated}
        />
      )}
    </div>
  );
};

export const piechartBlock = createReactBlockSpec(
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
          id={block.id}
          name={block.props.name}
          onChange={(name, tableData) => {
            editor.updateBlock(block, {
              type: "chart",
              props: { name: name, tableData: JSON.stringify(tableData) },
            });
          }}
          tableData={JSON.parse(block.props.tableData)}
          onChartCreated={() => {}}
        />
      );
    },
  }
);

export const insertPieChartBlock: ReactSlashMenuItem<
  BlockSchemaWithBlock<"chart", typeof piechartBlock.config>
> = {
  name: "Pie Chart Block",
  execute: (editor) => {
    const id = Date.now().toString(); // 고유 ID 생성
    editor.insertBlocks(
      [
        {
          id,
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
  hint: "Insert a pie chart block!",
};

export default RenderChartBlock;
