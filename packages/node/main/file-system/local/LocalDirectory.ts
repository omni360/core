import {Stats} from 'fs';
import {DateTime} from '@monument/time/main/DateTime';
import {Path} from '../../path/Path';
import {Directory} from '../Directory';


export class LocalDirectory extends Directory {

    public constructor(path: Path, stats: Stats) {
        super(
            path,
            DateTime.fromDate(stats.atime),
            DateTime.fromDate(stats.mtime),
            DateTime.fromDate(stats.ctime),
            DateTime.fromDate(stats.birthtime),
            stats.mode & 0o777,
            stats.dev,
            stats.rdev,
            stats.uid,
            stats.gid
        );
    }
}