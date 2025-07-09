import { Op, Transaction } from "sequelize";
import { log } from "../Logger";
import { Job } from "../Models";
import { IJobForm } from "../Models/Job";

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

        const count: number = await Job.count({ where: whereClause });

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

    public async createJob(data: IJobForm): Promise<[boolean, Job?, Error?]> {
        const transaction: Transaction = await Job.sequelize!.transaction();

        try {
            const job = await Job.create({ ...data }, { transaction });
            await transaction.commit();
            log("green", "JOB", `Created job: ${job.id}`);
            return [true, job];
        } catch (error: any) {
            await transaction.rollback();
            log("red", "JOB", `Failed to create job: ${error.message}`);
            return [false, undefined, error];
        }
    }

    public async getJobById(id: string): Promise<[boolean, Job?, Error?]> {
        try {
            const job = await Job.findByPk(id);
            if (!job) {
                log("yellow", "JOB", `Job not found by ID: ${id}`);
                return [true, undefined, new Error("Could not find Job with id " + id)];
            }

            log("green", "JOB", `Found Job with id ${id}`);
            return [true, job];
        } catch (error: any) {
            log("red", "JOB", `Error retrieving Job by ID ${id}: ${error.message}`);
            return [false, undefined, error];

        }
    }

    public async updateJobById(id: string, data: IJobForm): Promise<[boolean, Job?, Error?]> {
        try {
            const job = await Job.findByPk(id);

            if (!job) {
                log("yellow", "JOB", `Update failed: job not found with ID ${id}`);
                return [true, undefined, new Error("Could not find job with id " + id)];
            }

            log("green", "JOB", `Updated job: ${job.id}`);
            return [true, job];
        } catch (error: any) {
            log("red", "JOB", `Failed to update job: ${error.message}`);
            return [false, undefined, error];
        }
    }

    public async deleteJobById(id: string): Promise<[boolean, Error?]> {
        const transaction: Transaction = await Job.sequelize!.transaction();

        try {
            const job = await Job.findByPk(id, { transaction });
            if (!job) {
                log("yellow", "JOB", `Job not found with ID ${id}`);
                return [true, new Error("Could not find job with id " + id)];
            }

            await job.destroy();
            await transaction.commit();

            log("green", "JOB", `Deleted job: ${job.id}`);
            return [true];
        } catch (error: any) {
            log("red", "JOB", `Failed to delete job: ${error.message}`);
            return [false, error];
        }
    }

    public async setInputFile(jobId: string, fileUrl: string): Promise<[boolean, Job?, Error?]> {
        const transaction: Transaction = await Job.sequelize!.transaction();

        try {
            const job = await Job.findByPk(jobId, { transaction });
            if (!job) throw new Error("Job not found");

            job.input_path = fileUrl;
            await job.save({ transaction });

            await transaction.commit();
            log("blue", "JOB", `Updated input_file for job: ${jobId}`);
            return [true, job];
        } catch (error: any) {
            await transaction.rollback();
            log("red", "JOB", `Failed to update input_file: ${error.message}`);
            return [false, undefined, error];
        }
    }

    public async setOutputFile(jobId: string, fileUrl: string): Promise<[boolean, Job?, Error?]> {
        const transaction: Transaction = await Job.sequelize!.transaction();

        try {
            const job = await Job.findByPk(jobId, { transaction });
            if (!job) throw new Error("Job not found");

            job.output_path = fileUrl;
            await job.save({ transaction });

            await transaction.commit();
            log("blue", "JOB", `Updated input_file for job: ${jobId}`);
            return [true, job];
        } catch (error: any) {
            await transaction.rollback();
            log("red", "JOB", `Failed to update input_file: ${error.message}`);
            return [false, undefined, error];
        }
    }
}

export default new JobService();