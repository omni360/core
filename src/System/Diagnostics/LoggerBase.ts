import {ILogger} from './ILogger';
import {ILogRecord} from './ILogRecord';
import {Assert} from '../../Core/Assertion/Assert';
import {FormattableString} from '../../Core/Text/FormattableString';
import {EMPTY_STRING} from '../../Core/Text/constants';
import {InvalidArgumentException} from '../../Core/Exceptions/InvalidArgumentException';


const NEW_LINE_SIGN: string = '\n';


export abstract class LoggerBase implements ILogger {
    private _lineSeparator: string = NEW_LINE_SIGN;


    public get lineSeparator(): string {
        return this._lineSeparator;
    }


    public set lineSeparator(value: string) {
        Assert.argument('value', value).notNull();

        if (value === EMPTY_STRING) {
            throw new InvalidArgumentException('Line separator cannot be an empty string.');
        }

        this._lineSeparator = value;
    }


    public async write(record: ILogRecord): Promise<void> {
        Assert.argument('record', record).notNull();

        await this.doWrite(record);
    }


    public async writeLine(message: string): Promise<void> {
        await this.write(message + this._lineSeparator);
    }


    public async writeFormat(format: string, ...values: any[]): Promise<void> {
        Assert.argument('format', format).notNull();

        let template: FormattableString = new FormattableString(format);

        await this.writeLine(template.fillByPositions(values));
    }


    protected abstract doWrite(record: ILogRecord): Promise<void>;
}
