import {Op, Transaction} from "sequelize";
import {log} from "../Logger";
import {File} from "../Models";

class FileService {
    public async paginateFiles(itemsPerPage: number, page: number, sort: string, search: string): Promise<{
        totalItems: number,
        totalPages: number,
        currentPage: number,
        data: any[]
    }> {
        const usePagination: boolean = itemsPerPage < 0;

        const count: number = await File.count();

        const files = await File.findAll({
            order: [["created_at", "DESC"]],
            ...(usePagination && {
                offset: (page - 1) * itemsPerPage,
                limit: itemsPerPage
            })
        });

        return {
            totalItems: count,
            totalPages: usePagination ? Math.ceil(count / itemsPerPage) : 1,
            currentPage: page,
            data: files.map(f => f.toJSON()),
        }
    }
}

export default new FileService();