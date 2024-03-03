import {
  BlockSchemaWithBlock,
  defaultProps,
  // createReactBlockSpec,
} from "@blocknote/core";
import { ReactSlashMenuItem, createReactBlockSpec } from "@blocknote/react";
import { MinusCircle, PieChart, PlusCircle } from "lucide-react";

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
  preview,
}: {
  id: string; // 차트마다 id값
  name: string;
  tableData: string[][];
  onChange: (name: string, tableData: string[][]) => void;
  onChartCreated: () => void;
  preview: boolean;
}) => {
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

  return (
    <div>
      <div className="flex items-center justify-between mr-[38px]">
        <h1 style={{ fontWeight: "bold" }}>Chart Table</h1>
      </div>
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
                  disabled={preview}
                />
              </td>
            ))}
            {!preview && (
              <td><MinusCircle className="text-red-500" role="button" onClick={() => deleteRow(rowIndex)}/></td>
            )}
          </tr>
        ))}
      </table>
      {!preview && (
        <div className="flex justify-between w-[506px]">
        <button
          onClick={addRow} className="border border-[#dddddd] border-t-0 p-1"
        >
          <PlusCircle/>
        </button>
        <button
          onClick={onChartCreated}
          style={{
            borderRadius: "10px",
            border: "solid 2px #FFA979",
            color: "#cc8760",
            fontWeight: "bold",
            padding: "5px",
            margin: "5px",
          }}
        >
          차트로 변환
        </button>
        </div>
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
          onChartCreated={() => {
            editor.updateBlock(block, {
              type: "piechart",
            });
          }}
          preview={!editor.isEditable}
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
