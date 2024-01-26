import { BlockSchemaWithBlock, defaultProps } from "@blocknote/core";
import { ReactSlashMenuItem, createReactBlockSpec } from "@blocknote/react";
import { CheckSquare } from "lucide-react";

export const CheckBoxBlockSpec = createReactBlockSpec(
  {
    type: "checkbox",
    propSchema: {
      ...defaultProps,
      checked: {
        default: false,
      }
    },
    content: "inline",
  },
  {
    render: ({ block, editor, contentRef }) => {
      return (
        <div className={"checkbox"}>
          <div className="flex">
            <input
              type="checkbox"
              checked={block.props.checked}
              onChange={e => (editor.isEditable && editor.updateBlock(block, {
                type: "checkbox",
                props: {
                  checked: e.target.checked
                }
            }))} />
            <div style={{marginLeft: "12px"}}>
              <div className={"inline-content"} ref={contentRef} />
            </div>
          </div>
        </div>
      );
    },
  }
);

export const insertCheckBoxBlock: ReactSlashMenuItem<
  BlockSchemaWithBlock<"checkbox", typeof CheckBoxBlockSpec.config>
> = {
  name: "checkbox",
  execute: (editor) => {
    editor.insertBlocks(
      [
        {
          type: "checkbox"
        }
      ],
      editor.getTextCursorPosition().block,
      "before"
    );
  },
  aliases: [
    "checkbox",
  ],
  group: "Work",
  icon: <CheckSquare width="14" height="14" />,
  hint: "Checkbox",
}