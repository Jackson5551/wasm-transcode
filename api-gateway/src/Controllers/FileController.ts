import {Request, RequestHandler, Response} from "express";
import FileService from "../Services/FileService";

class FileController {
    public async index(req: Request, res: Response) {
        try {
            const itemsPerPage = parseInt(req.query.limit as string) || 50;
            const page = parseInt(req.query.page as string) || 1;
            const sort = (req.query.sort as string) ?? '';
            const search = (req.query.search as string) ?? '';

            const result = await FileService.paginateFiles(
                itemsPerPage,
                page,
                sort,
                search,
            );

            console.log(result);

            return res.json(result);
        } catch (error) {
            return res.status(500).json({
                error: `Could not fetch files. ${error}`,
            })
        }
    }
}

export default new FileController();