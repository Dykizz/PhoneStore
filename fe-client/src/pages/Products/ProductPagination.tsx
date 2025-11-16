import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import type { MetaPagination } from "@/interfaces/pagination.interface";

interface ProductPaginationProps {
  pagination: MetaPagination;
  setPagination: (pagination: MetaPagination) => void;
}
export default function ProductPagination({
  pagination,
  setPagination,
}: ProductPaginationProps) {
  return (
    <Pagination>
      <PaginationContent className="flex justify-center gap-1">
        <PaginationItem>
          <Button
            disabled={!pagination.hasPrev}
            onClick={() => {
              const newPage = pagination.page - 1;
              setPagination({ ...pagination, page: newPage });
            }}
            className={`border bg-white border-gray-300 text-gray-700 hover:bg-gray-100 ${
              !pagination.hasPrev ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            Trang trước
          </Button>
        </PaginationItem>

        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
          (page) => (
            <PaginationItem key={page}>
              <Button
                variant={page === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPagination({ ...pagination, page });
                }}
                className="border border-gray-300 rounded-md"
              >
                {page}
              </Button>
            </PaginationItem>
          )
        )}

        {pagination.totalPages > 5 && <PaginationEllipsis />}

        <PaginationItem>
          <Button
            disabled={!pagination.hasNext}
            onClick={() => {
              const newPage = pagination.page + 1;
              setPagination({ ...pagination, page: newPage });
            }}
            className={`border bg-white  border-gray-300 text-gray-700 hover:bg-gray-100 ${
              !pagination.hasNext ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            Trang sau
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
