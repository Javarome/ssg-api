import { FileWriteConfig } from "../FileWriteConfig"

export abstract class DirectoryStepConfig extends FileWriteConfig {
  /**
   * A list of directories to look into.
   */
  readonly rootDirs: string[] = []

  /**
   * A list of directories to avoid looking into.
   */
  readonly excludedDirs: string[] = []

  /**
   * The name of the file containing the <--#echo var="directories"--> tag
   */
  readonly templateFileName: string = ""
}
