import { Table } from "@tanstack/react-table"
import { DBRecordType, tagListType } from "../actions"
import { DataTableFacetedFilter } from "./data-table-facedted-filter"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Cross2Icon } from "@radix-ui/react-icons"
import { DataTableViewOptions } from "./data-view-options"
import { Post, Tag, TagGroup } from "@prisma/client"



interface DataTableToolbarProps {
    table: Table<({tags: Tag[]}&Post)>,
    tags: Tag[],
}

function getTagList(tags: Tag[]) {
    return tags.map((tag) =>{
        return {
            label: tag.label ?? tag.tag,
            value: tag.tag,
        }
    })
}

export default function DataTableToolbar({table, tags}: DataTableToolbarProps) {



    const isFiltered = table.getState().columnFilters.length > 0
    return (
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Filter by data..."
              value={(table.getColumn("content")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("content")?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px]"
            />
            {table.getColumn("tags") && (
              <DataTableFacetedFilter
                column={table.getColumn("tags")}
                title="Tags"
                options={getTagList(tags)}
              />
            )}
            {table.getColumn("read") && (
              <DataTableFacetedFilter
                column={table.getColumn("read")}
                title="Read"
                options={[
                  { label: "Read", value: "Read" },
                  { label: "Unread", value: "Unread" },
                ]}
              />
            )}
            {isFiltered && (
              <Button
                variant="ghost"
                onClick={() => table.resetColumnFilters()}
                className="h-8 px-2 lg:px-3"
              >
                Reset
                <Cross2Icon className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          <DataTableViewOptions table={table} />
        </div>
      )
}