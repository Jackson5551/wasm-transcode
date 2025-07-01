import {Op, Transaction} from "sequelize";
import {log} from "../Logger";
import {Job} from "../Models";
import {IJobForm} from "../Models/Job";

class JobService {
    public async paginateJobs(itemsPerPage: number, page: number, sort: string, search: string): Promise<{
        totalItems: number,
        totalPages: number,
        currentPage: number,
        data: any[]
    }> {
        const usePagination: boolean = itemsPerPage > 0;

        const whereClause: any = {
            deleted_at: null,
        };

        if (search?.trim()) {
            whereClause.title = {
                [Op.like]: `%${search}%`
            };
            log("magenta", "JOB", `Searching jobs for title: "${search}"`);
        }

        const count: number = await Job.count({where: whereClause});

        const jobs = await Job.findAll({
            where: whereClause,
            order: [['title', 'ASC']],
            ...(usePagination && {
                offset: (page - 1) * itemsPerPage,
                limit: itemsPerPage
            })
        });

        log("green", "JOBS", `Fetched ${jobs.length} jobs (Page ${page})`);

        return {
            totalItems: count,
            totalPages: usePagination ? Math.ceil(count / itemsPerPage) : 1,
            currentPage: page,
            data: jobs.map(p => p.toJSON()),
        }
    }

    public async createJob(data:IJobForm): Promise<[boolean, Job?, Error?]> {
        const transaction: Transaction = await Job.sequelize!.transaction();

        try {
            const job = await Job.create({...data}, {transaction});
            await transaction.commit();
            log("green", "JOB", `Created job: ${job.title}`);
            return [true, job];
        } catch (error: any) {
            await transaction.rollback();
            log("red", "JOB", `Failed to create job: ${error.message}`);
            return [false, undefined, error];
        }
    }

    public async getJobById(id: string): Promise<[boolean, Job?, Error?]> {

    }
}