import {Request, RequestHandler, Response} from "express";
import JobService from "../Services/JobService";
import {IJobForm} from "../Models/Job";
import DataSanitizer from "../utils/DataSanitizer";

class JobController {
    public async index(req: Request, res: Response) {
        try {
            const itemsPerPage = parseInt(req.query.limit as string) || 50;
            const page = parseInt(req.query.page as string) || 1;
            const sort = (req.query.sort as string) ?? '';
            const search = (req.query.search as string) ?? '';

            const result = JobService.paginateJobs(itemsPerPage, page, sort, search);

            return res.json(result);
        } catch (error) {
            return res.status(500).json({
                error: `Could not fetch jobs. ${error}`,
            })
        }
    }

    public async store(req: Request, res: Response) {
        try {
            const jobData = req.body ?? {};

            const allowedKeys: (keyof IJobForm)[] = ["input_path", "output_path", "input_format", "output_format"];

            const filteredData = DataSanitizer.filterAllowedKeys<IJobForm>(jobData, allowedKeys);

            const [success, job, error] = await JobService.createJob(filteredData);

            if(!success || !job) {
                return res.status(500).json({ error: `Could not create job. ${error}` });
            }

            return res.status(201).json({job});
        } catch (error) {
            return res.status(500).json({ error: `Could not create job. ${error}` });
        }
    }

    public async show(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const [success, job, error] = await JobService.getJobById(id);

            if(!success) {
                return res.status(500).json({ error: `Could not find job. ${error}` });
            }

            if(!job) {
                return res.status(404).json({error: 'Job not found.'});
            }

            return res.status(200).json({job});
        } catch (error) {
            return res.status(500).json({ error: `Could not find job. ${error}` });
        }
    }

    public async update(req: Request, res: Response) {}

    public async delete(req: Request, res: Response) {}

    public async status(req: Request, res: Response) {}
}

export default new JobController();