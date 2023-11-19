---
title: Models
---

:::warning

Draft Specification: functionality has not been implemented yet. 

Feedback: [HackMD: Models Spec](https://hackmd.io/ulO3uB1AQCqLa5SAAMFOQw) 

:::

## Overview

Jan's Model API aims to be as similar as possible to [OpenAI's Models API](https://platform.openai.com/docs/api-reference/models), with additional methods for managing and running models locally. 

### User Objectives

- Users can start/stop models and use them in a thread (or via Chat Completions API)
- Users can download, import and delete models  
- User can configure model settings at the model level or override it at thread-level
- Users can use remote models (e.g. OpenAI, OpenRouter)

## Models Folder

Models in Jan are stored in the `/models` folder. 

 `<model-name>.json` files. 

- Everything needed to represent a `model` is packaged into an `Model folder`.
- The `folder` is standalone and can be easily zipped, imported, and exported, e.g. to Github.
- The `folder` always contains at least one `Model Object`, declared in a `json` format.
- The `folder` and `file` do not have to share the same name
- The model `id` is made up of `folder_name/filename` and is thus always unique.

```sh
/janroot
    /models
        azure-openai/                       # Folder name
            azure-openai-gpt3-5.json        # File name

        llama2-70b/
            model.json
            .gguf
```

## Model Object

Models in Jan are represented as `json` objects, and are colloquially known as `model.jsons`. 

Jan's models follow a `<model_name>.json` naming convention. 

Jan's `model.json` aims for rough equivalence with [OpenAI's Model Object](https://platform.openai.com/docs/api-reference/models/object), and add additional properties to support local models.  

Jan's `model.json` object properties are optional, i.e. users should be able to run a model declared by an empty `json` file.

```json
// ./models/zephr/zephyr-7b-beta-Q4_K_M.json
{
    "source_url": "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/blob/main/zephyr-7b-beta.Q4_K_M.gguf",
    "parameters": {
        "init": {
            "ctx_len": "2048",
            "ngl": "100",
            "embedding": "true",
            "n_parallel": "4",
            "pre_prompt": "A chat between a curious user and an artificial intelligence",
            "user_prompt": "USER: ",
            "ai_prompt": "ASSISTANT: "
        },
        "runtime": {
            "temperature": "0.7",
            "token_limit": "2048",
            "top_k": "0",
            "top_p": "1",
            "stream": "true"
        }
    },
    "metadata": {
        "engine": "llamacpp",
        "quantization": "Q4_K_M",
        "size": "7B",
    }
}
```

| Property                | Type                                                          | Description                                                               | Validation                                       |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------ |
| `object`                | enum: `model`, `assistant`, `thread`, `message`               | Type of the Jan Object. Always `model`                                    | Defaults to "model"                              |
| `source_url`            | string                                                        | The model download source. It can be an external url or a local filepath. | Defaults to `pwd`. See [Source_url](#Source_url) |
| `parameters`            | map                                                           | Defines default model run parameters used by any assistant.               | Defaults to `{}`                                 |
| `description`           | string                                                        | A vanity description of the model                                         | Defaults to ""                                   |
| `metadata`              | map                                                           | Stores additional structured information about the model.                 | Defaults to `{}`                                 |
| `metadata.engine`       | enum: `llamacpp`, `api`, `tensorrt`                           | The model backend used to run model.                                      | Defaults to "llamacpp"                           |
| `metadata.quantization` | string                                                        | Supported formats only                                                    | See [Custom importers](#Custom-importers)        |
| `metadata.binaries`     | array                                                         | Supported formats only.                                                   | See [Custom importers](#Custom-importers)        |
| `state`                 | enum[`to_download` , `downloading`, `ready` , `running`] | Needs more thought                                                        | Defaults to `to_download`                     |
| `name`                  | string                                                        | A vanity name                                                             | Defaults to filename                             |

### Model Source

There are 3 types of model sources

- Local model
- Remote source
- Cloud API

- Users can download models from a `remote` source or reference an existing `local` model.
- If this property is not specified in the Model Object file, then the default behavior is to look in the current directory.
- Users can import a local model by providing the filepath to the model

```json
// ./models/llama2/llama2-7bn-gguf.json
"source_url": "~/Downloads/llama-2-7bn-q5-k-l.gguf",

// Default, if property is omitted
"source_url": "./",
```

- Users can download a model by remote URL.
- Supported url formats:
  - `https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/blob/main/llama-2-7b-chat.Q3_K_L.gguf`
  - `https://any-source.com/.../model-binary.bin`

- Using a remote API to access model `model-azure-openai-gpt4-turbo.json`
- See [source](https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart?tabs=command-line%2Cpython&pivots=rest-api)

```json
"source_url": "https://docs-test-001.openai.azure.com/openai.azure.com/docs-test-001/gpt4-turbo",
"parameters": {
  "init" {
    "API-KEY": "",
    "DEPLOYMENT-NAME": "",
    "api-version": "2023-05-15"
  },
  "runtime": {
    "temperature": "0.7",
    "max_tokens": "2048",
    "presence_penalty": "0",
    "top_p": "1",
    "stream": "true"
  }
}
"metadata": {
    "engine": "api",
}
```

### Model Formats

Additionally, Jan supports importing popular formats. For example, if you provide a HuggingFace URL for a `TheBloke` model, Jan automatically downloads and catalogs all quantizations. Custom importers autofills properties like `metadata.quantization` and `metadata.size`.

Supported URL formats with custom importers:

- `huggingface/thebloke`: [Link](https://huggingface.co/TheBloke/Llama-2-7B-GGUF)
- `huggingface/thebloke`: [Link](https://huggingface.co/TheBloke/Llama-2-7B-GGUF)
- `janhq`: `TODO: put URL here`
- `azure_openai`: `https://docs-test-001.openai.azure.com/openai.azure.com/docs-test-001/gpt4-turbo`
- `openai`: `api.openai.com`

<details>
    <summary>Example: Zephyr 7B</summary>

- Model has 1 binary `model-zephyr-7B.json`
- See [source](https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/)

```json
// ./models/zephr/zephyr-7b-beta-Q4_K_M.json
// Note: Default fields omitted for brevity
"source_url": "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/blob/main/zephyr-7b-beta.Q4_K_M.gguf",
"parameters": {
  "init": {
    "ctx_len": "2048",
    "ngl": "100",
    "embedding": "true",
    "n_parallel": "4",
    "pre_prompt": "A chat between a curious user and an artificial intelligence",
    "user_prompt": "USER: ",
    "ai_prompt": "ASSISTANT: "
  },
  "runtime": {
    "temperature": "0.7",
    "token_limit": "2048",
    "top_k": "0",
    "top_p": "1",
    "stream": "true"
  }
},
"metadata": {
    "engine": "llamacpp",
    "quantization": "Q3_K_L",
    "size": "7B",
}
```
</details>

### Multiple binaries

- Model has multiple binaries `model-llava-1.5-ggml.json`
- See [source](https://huggingface.co/mys/ggml_llava-v1.5-13b)

```json
"source_url": "https://huggingface.co/mys/ggml_llava-v1.5-13b",
"parameters": {"init": {}, "runtime": {}}
"metadata": {
    "mmproj_binary": "https://huggingface.co/mys/ggml_llava-v1.5-13b/blob/main/mmproj-model-f16.gguf",
    "ggml_binary": "https://huggingface.co/mys/ggml_llava-v1.5-13b/blob/main/ggml-model-q5_k.gguf",
    "engine": "llamacpp",
    "quantization": "Q5_K"
}
```

## Models API

### Get Model

- OpenAI Equivalent: https://platform.openai.com/docs/api-reference/models/retrieve
- OpenAI Equivalent: https://platform.openai.com/docs/api-reference/models/object
- The `Jan Model Object` maps into the `OpenAI Model Object`.
- Properties marked with `*` are compatible with the [OpenAI `model` object](https://platform.openai.com/docs/api-reference/models)
- Note: The `Jan Model Object` has additional properties when retrieved via its API endpoint.

#### Request

```shell
curl {JAN_URL}/v1/models/{model_id}
```

#### Response

```json
{
  "id": "model-zephyr-7B",
  "object": "model",
  "created_at": 1686935002,
  "owned_by": "thebloke",
  "state": "running",
  "source_url": "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/blob/main/zephyr-7b-beta.Q4_K_M.gguf",
  "parameters": {
     "ctx_len": 2048,
     "ngl": 100,
     "embedding": true,
     "n_parallel": 4,
     "pre_prompt": "A chat between a curious user and an artificial intelligence",
     "user_prompt": "USER: ",
     "ai_prompt": "ASSISTANT: ",
     "temperature": "0.7",
     "token_limit": "2048",
     "top_k": "0",
     "top_p": "1",
  },
  "metadata": {
     "engine": "llamacpp",
     "quantization": "Q3_K_L",
     "size": "7B",
  }
}
```

### List models
Lists the currently available models, and provides basic information about each one such as the owner and availability.
> OpenAI Equivalent: https://platform.openai.com/docs/api-reference/models/list

#### Request

```shell=
curl {JAN_URL}/v1/models
```

#### Response

```json
{
  "object": "list",
  "data": [
    {
      "id": "model-zephyr-7B",
      "object": "model",
      "created_at": 1686935002,
      "owned_by": "thebloke",
      "state": "running"
    },
    {
      "id": "ft-llama-70b-gguf",
      "object": "model",
      "created_at": 1686935002,
      "owned_by": "you",
      "state": "stopped"
    },
    {
      "id": "model-azure-openai-gpt4-turbo",
      "object": "model",
      "created_at": 1686935002,
      "owned_by": "azure_openai",
      "state": "running"
    },
  ],
  "object": "list"
}
```

### Delete Model
> OpenAI Equivalent: https://platform.openai.com/docs/api-reference/models/delete

#### Request

```shell
curl -X DELETE {JAN_URL}/v1/models/{model_id}
```

#### Response

```json
{
  "id": "model-zephyr-7B",
  "object": "model",
  "deleted": true,
  "state": "to_download"
}
```

### Start Model
> Jan-only endpoint
The request to start `model` by changing model state from `ready` to `running`

#### Request

```shell
curl -X PUT {JAN_URL}/v1/models{model_id}/start
```

#### Response

```json
{
  "id": "model-zephyr-7B",
  "object": "model",
  "state": "running"
}
```

### Stop Model
> Jan-only endpoint
The request to start `model` by changing model state from `running` to `ready`

#### Request

```shell
curl -X PUT {JAN_URL}/v1/models/{model_id}/stop
```

#### Response

```json
{
  "id": "model-zephyr-7B",
  "object": "model",
  "state": "ready"
}
```

### Download Model
> Jan-only endpoint
The request to download `model` by changing model state from `to_download` to `downloading` then `ready`once it's done.

#### Request
```shell
curl -X POST {JAN_URL}/v1/models/
```

#### Response
```json
{
  "id": "model-zephyr-7B",
  "object": "model",
  "state": "downloading"
}
```

## Examples

### Pre-loaded Models

- Jan ships with a default model folders containing recommended models
- Only the Model Object `json` files are included
- Users must later explicitly download the model binaries
- 
```sh
models/
    mistral-7b/
        mistral-7b.json
    hermes-7b/
        hermes-7b.json
```

### Azure OpenAI

- Using a remote API to access model `model-azure-openai-gpt4-turbo.json`
- See [source](https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart?tabs=command-line%2Cpython&pivots=rest-api)

```json
"source_url": "https://docs-test-001.openai.azure.com/openai.azure.com/docs-test-001/gpt4-turbo",
"parameters": {
  "init" {
    "API-KEY": "",
    "DEPLOYMENT-NAME": "",
    "api-version": "2023-05-15"
  },
  "runtime": {
    "temperature": "0.7",
    "max_tokens": "2048",
    "presence_penalty": "0",
    "top_p": "1",
    "stream": "true"
  }
}
"metadata": {
    "engine": "api",
}
```

### Multiple quantizations

- Each quantization has its own `Jan Model Object` file

```sh
llama2-7b-gguf/
    llama2-7b-gguf-Q2.json
    llama2-7b-gguf-Q3_K_L.json
    .bin
```

### Multiple model partitions

- A Model that is partitioned into several binaries use just 1 file

```sh
llava-ggml/
    llava-ggml-Q5.json
    .proj
    ggml
```

### Your locally fine-tuned model

- ??

```sh
llama-70b-finetune/
    llama-70b-finetune-q5.json
    .bin
```