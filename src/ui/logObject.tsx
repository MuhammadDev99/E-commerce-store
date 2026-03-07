export default function LogObject(data: any) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
