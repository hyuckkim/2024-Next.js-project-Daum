
import { ElementRef, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import ChartDataLabels from 'chartjs-plugin-datalabels';

const PieChartComponent = ({
  id, // 차트마다 id값
  tableData,
  onTableCreated,
  preview,
}: {
  id: string; // 차트마다 id값
  tableData: string[][];
  onTableCreated: () => void,
  preview: boolean,
}) => {
  const chartRef = useRef<ElementRef<"canvas">>(null);

  useEffect(() => {
    // JSON 데이터를 파이 차트 데이터 형식으로 변환
    const labels = tableData.map((row) => row[0]); // 첫 번째 열을 라벨로 사용
    const data = tableData.map((row) => parseFloat(row[1])); // 두 번째 열을 데이터로 사용

    // 차트 생성
    const ctx = chartRef.current; // ID 값 -> 캔버스 요소
    if (ctx === null) return;

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
      options: {
        plugins: {
          datalabels: {
            labels: {
              label: {
                font: {size: 25},
                color: "grey"
              },
            }
          }
        }
      },
      plugins: [ChartDataLabels],
    });

    // 컴포넌트가 언마운트되기 전에 차트 파기
    return () => {
      chart.destroy();
    };
  }, [id, tableData, chartRef]);

  return (
    <div>
      <div className="flex items-center">
      </div>
      <div style={{ width: "450px", height: "450px" }}>
        <canvas id={`${id}_pieChart`} width="100%" height="100%" ref={chartRef}></canvas>
      </div>
      {!preview && (
        <div className="flex justify-end w-[506px]">
        <button
          onClick={onTableCreated}
          style={{
            borderRadius: "10px",
            border: "solid 2px #FFA979",
            color: "#cc8760",
            fontWeight: "bold",
            padding: "5px",
            margin: "5px",
          }}
        >
          표로 변환
        </button>
      </div>
      )}
    </div>
  ); // 차트 ID값 사용-> 서로 다른 캔버스 생성 // 차트 ID값 사용-> 서로 다른 캔버스 생성
};

export const piechart = createReactBlockSpec(
  {
    type: "piechart",
    propSchema: {
      ...defaultProps,
      name: {
        default: "pie chart",
      },
      tableData: {
        default: JSON.stringify([]),
      },
    } as const,
    content: "none",
  },
  {
    render: ({ block, editor }: { block: any; editor: any }) => {
      return (
      <PieChartComponent
        id={block.id}
        tableData={JSON.parse(block.props.tableData)}
        onTableCreated={() => {
          editor.updateBlock(block, {
            type: "chart",
          });
        }}
        preview={!editor.isEditable}
      />
      );
    },
  }
);